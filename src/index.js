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
  bold = false,
  dataset = {},
  flex = false,
  fontSize,
  src,
  alt,
  size,
} = {}) {
  const elem = document.createElement(elementType);

  if (elementType === 'img') {
    elem.style.display = 'block';
    elem.style.objectFit = 'contain';
  }
  if (elementType === 'ul') {
    elem.style.listStyle = 'none';
  }
  if (elementType === 'li' && flex) {
    elem.style.alignItems = 'center';
    elem.style.columnGap = `${20}px`;
  }
  if (elementType === 'button') {
    elem.style.background = 'aqua';
    elem.style.border = 'none';
    elem.style.fontSize = `${20}px`;
    elem.style.width = `${60}px`;
    elem.style.width = `${60}px`;
  }

  if (innerText) elem.innerText = innerText;
  if (bold) elem.style.fontWeight = '700';
  if (flex) elem.style.display = 'flex';
  if (fontSize) elem.style.fontSize = `${fontSize}px`;
  if (src) elem.src = src;
  if (alt) elem.alt = alt;
  if (size) {
    elem.style.width = `${size}px`;
    elem.style.height = `${size}px`;
  }

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
      flex: true,
    });

    li.append(
      createElement({
        elementType: 'button',
        dataset: { index },
        innerText: 'ℹ',
        bold: true,
        size: 30,
      }),
      createElement({
        elementType: 'img',
        src: svg,
        alt: alt,
        size: 60,
      }),
      createElement({
        elementType: 'p',
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
    });

    // First Item
    const li1 = createElement({
      elementType: 'li',
      flex: true,
    });
    li1.append(
      createElement({
        elementType: 'img',
        src: svg,
        alt: alt,
        size: 40,
      }),
      createElement({
        elementType: 'h1',
        innerText: officialName,
      })
    );

    // Second Item
    const li2 = createElement({
      elementType: 'li',
    });
    Object.entries(dataInfo).forEach(key => {
      const title = key[0];
      const values = key[1];

      const p = createElement({
        elementType: 'p',
        innerText: values,
        fontSize: 20,
      });
      p.prepend(
        createElement({
          elementType: 'span',
          innerText: capitalizeFirstLetter(`${title}: `),
          bold: true,
        })
      );
      li2.append(p);
    });

    ul.append(li1, li2);

    if (btnIndex === idx) {
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
          console.log(error);
          Notify.failure('Oops, there is no country with that name');
        });
    }, DEBOUNCE_DELAY)
  );
});
