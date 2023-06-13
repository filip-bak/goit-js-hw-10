import './css/styles.css';
import { fetchCountries } from './fetchCountries';
import debounce from 'lodash.debounce';
import { Notify } from 'notiflix';

const DEBOUNCE_DELAY = 300;

let searchBoxEl;
let countryListEl;
let countryInfoEl;
let infoButton;

function createElement({
  elementType,
  innerText,
  dataset = {},
  classes,
  src,
  alt,
} = {}) {
  const elem = document.createElement(elementType);

  if (innerText) elem.innerText = innerText;
  if (classes) elem.classList.add(...classes);
  if (src) elem.src = src;
  if (alt) elem.alt = alt;

  Object.keys(dataset).forEach(key => {
    elem.dataset[key] = dataset[key];
  });

  return elem;
}

function capitalizeFirstLetter(word) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

const listOfCountriesLayout = object => {
  let allCountries = [];
  object.forEach((el, index) => {
    const {
      name: { official: officialName },
      flags: { svg, alt },
    } = el;

    const li = createElement({
      elementType: 'li',
      classes: ['country-list__item'],
      flex: true,
    });

    li.append(
      createElement({
        elementType: 'button',
        dataset: { index },
        innerText: 'i',
        classes: ['btn-info'],
      }),
      createElement({
        elementType: 'img',
        classes: ['flag', 'flag--small'],
        src: svg,
        alt: alt,
      }),
      createElement({
        elementType: 'p',
        classes: ['country-list__name'],
        innerText: officialName,
      })
    );

    allCountries.push(li);
  });
  return allCountries;
};

const countryInfoLayout = (object, btnIndex) => {
  let allInfoCountries = [];
  object.forEach((el, idx) => {
    const {
      capital: [capital],
      population,
      languages: languageObj,
      name: { official: officialName },
      flags: { svg, alt },
    } = el;

    const languageValues = Object.values(languageObj);
    const languages = languageValues.join(', ');
    const dataInfo = { capital, population, languages };

    const ul = createElement({
      elementType: 'ul',
      classes: ['country-info__list'],
    });

    // First Item
    const div = createElement({
      elementType: 'div',
      classes: ['country-info__container'],
      flex: true,
    });
    div.append(
      createElement({
        elementType: 'img',
        classes: ['flag'],
        src: svg,
        alt: alt,
      }),
      createElement({
        elementType: 'h1',
        classes: ['country-info__title'],
        innerText: officialName,
      })
    );

    // Second Item
    const li = createElement({
      elementType: 'li',
    });
    Object.entries(dataInfo).forEach(key => {
      const title = key[0];
      const values = key[1];

      const p = createElement({
        elementType: 'p',
        classes: ['country-info__details'],
        innerText: values,
      });
      p.prepend(
        createElement({
          elementType: 'span',
          classes: ['bold'],
          innerText: capitalizeFirstLetter(`${title}: `),
          bold: true,
        })
      );
      li.append(p);
    });

    ul.append(li);

    if (btnIndex === idx) {
      allInfoCountries.push(div);
      allInfoCountries.push(ul);
    }
  });
  return allInfoCountries;
};

function renderCountries({
  objectOfCountries,
  renderWhat,
  index,
  renderOn,
} = {}) {
  renderOn.innerHTML = '';
  renderOn.append(...renderWhat(objectOfCountries));
  if (index) renderOn.append(...renderWhat(objectOfCountries, +index));
}

window.addEventListener('load', () => {
  searchBoxEl = document.querySelector('input#search-box');
  countryListEl = document.querySelector('ul.country-list');
  countryInfoEl = document.querySelector('div.country-info');

  countryListEl.style.listStyle = 'none';
  searchBoxEl.addEventListener(
    'input',
    debounce(() => {
      fetchCountries(searchBoxEl.value)
        .then(countryObject => {
          if (countryObject.length > 10) {
            return Notify.info(
              'Too many matches found. Please enter a more specific name.'
            );
          }

          countryInfoEl.innerHTML = '';
          renderCountries({
            objectOfCountries: countryObject,
            renderWhat: listOfCountriesLayout,
            renderOn: countryListEl,
          });

          if (countryObject.length === 1) {
            countryListEl.innerHTML = '';
            renderCountries({
              objectOfCountries: countryObject,
              renderWhat: countryInfoLayout,
              index: '0',
              renderOn: countryInfoEl,
            });
          }
          infoButton = document.querySelectorAll('button[data-index]');
          infoButton.forEach(el => {
            el.addEventListener('click', elem => {
              renderCountries({
                objectOfCountries: countryObject,
                renderWhat: countryInfoLayout,
                index: elem.target.dataset.index,
                renderOn: countryInfoEl,
              });
            });
          });
        })
        .catch(error => {
          if (searchBoxEl.value.length > 0) {
            Notify.failure('Oops, there is no country with that name');
          }
        });
    }, DEBOUNCE_DELAY)
  );
});
