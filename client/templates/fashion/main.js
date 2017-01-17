/* eslint "require-jsdoc": 0 */

const shirtColor = document.querySelector('#shirt-color');
const fontColor = document.querySelector('#font-color');
const shirt = document.querySelector('#shirt');
const text = document.querySelector('#text');

const updateShirtColor = () => {
  shirt.setAttribute('fill', shirtColor.value);
};
shirtColor.addEventListener('change', updateShirtColor);
shirtColor.addEventListener('input', updateShirtColor);

const updateFontColor = () => {
  text.style.color = fontColor.value;
};
fontColor.addEventListener('change', updateFontColor);
fontColor.addEventListener('input', updateFontColor);
