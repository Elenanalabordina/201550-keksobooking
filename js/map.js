'use strict';
var TITLES = ['Большая уютная квартира', 'Маленькая неуютная квартира', 'Огромный прекрасный дворец',
  'Маленький ужасный дворец', 'Красивый гостевой домик', 'Некрасивый негостеприимный домик',
  'Уютное бунгало далеко от моря', 'Неуютное бунгало по колено в воде'];
var TYPES = ['flat', 'house', 'bungalo'];
var CHECK_INS = ['12:00', '13:00', '14:00'];
var CHECK_OUTS = ['12:00', '13:00', '14:00'];
var FEATURES = ['wifi', 'dishwasher', 'parking', 'washer', 'elevator', 'conditioner'];
var FEATURES_LENGTH = FEATURES.length;
var LABEL_WIDTH = 40;
var LABEL_HEIGHT = 40;
var ESC_CODE = 27;
var ENTER_CODE = 13;

var template = document.querySelector('template').content;
var map = document.querySelector('.map');
var noticeForm = document.querySelector('.notice__form');
var mainPin = map.querySelector('.map__pin--main');
var mapPins = map.querySelector('.map__pins');
var nearByAds;
var popup;
var popupClose;
var isMapFaded = true;

var openPopup = function (src) {
  var offerIndex = getOfferIndex(src);
  if (offerIndex !== null) {
    renderOffer(nearByAds[offerIndex]);
    popup = document.querySelector('.popup');
    popupClose = popup.querySelector('.popup__close');
    popupClose.addEventListener('click', onPopupCloseClick);
    document.addEventListener('keydown', onPopupEscPress);
    popupClose.addEventListener('keydown', onPopupClosePress);
  }
};

var closePopup = function () {
  var activePin = mapPins.querySelector('.map__pin--active');
  if (activePin) {
    activePin.classList.remove('map__pin--active');
  }
  if (popup) {
    map.removeChild(popup);
    popup = null;
    popupClose.removeEventListener('click', onPopupCloseClick);
    document.removeEventListener('keydown', onPopupEscPress);
    popupClose.removeEventListener('keydown', onPopupClosePress);
  }
};

var onPopupCloseClick = function () {
  closePopup();
};

var onPopupEscPress = function (evt) {
  if (evt.keyCode === ESC_CODE) {
    closePopup();
  }
};

var onPopupClosePress = function (evt) {
  if (evt.keyCode === ENTER_CODE) {
    closePopup();
  }
};

var onMainPinMouseup = function () {
  if (isMapFaded) {
    map.classList.remove('map--faded');
    renderMapItems();
    var noticeFormFieldsets = noticeForm.querySelectorAll('fieldset');
    for (var i = 0; i < noticeFormFieldsets.length; i++) {
      noticeFormFieldsets[i].disabled = false;
    }
    noticeForm.classList.remove('notice__form--disabled');
    isMapFaded = false;
  }
};

var onMapPinsClick = function (evt) {
  closePopup();
  if (evt.target.parentNode.classList.contains('map__pin')) {
    evt.target.parentNode.classList.add('map__pin--active');
    openPopup(evt.target.src);
  } else if (evt.target.classList.contains('map__pin')) {
    evt.target.classList.add('map__pin--active');
    openPopup(evt.target.children[0].src);
  }

};

var onMapPinsPress = function (evt) {
  if (evt.keyCode === ENTER_CODE) {
    if (evt.target.classList.contains('map__pin')) {
      closePopup();
      evt.target.classList.add('map__pin--active');
      openPopup(evt.target.children[0].src);
    }
  }
};

mainPin.addEventListener('mouseup', onMainPinMouseup);
mapPins.addEventListener('click', onMapPinsClick);
mapPins.addEventListener('keydown', onMapPinsPress);

var getOfferIndex = function (src) {
  var index = null;
  nearByAds.forEach(function (item, i) {
    if (src.indexOf(item.author.avatar) >= 0) {
      index = i;
    }
  });
  return index;
};

var getRandomInt = function (min, max) {
  return Math.floor(Math.random() * (max - min) + min);
};

var shuffle = function (arr) {
  for (var i = arr.length - 1; i >= 1; i--) {
    var randomIndex = getRandomInt(0, i);
    var temp = arr[randomIndex];
    arr[randomIndex] = arr[i];
    arr[i] = temp;
  }
  return arr;
};

var generateNearbyAds = function (count) {
  var ads = [];
  for (var i = 0; i < count; i++) {
    var shuffledFeatures = shuffle(FEATURES);
    var chordX = getRandomInt(300, 900);
    var chordY = getRandomInt(100, 500);
    ads[i] = {
      author: {
        avatar: 'img/avatars/user0' + (i + 1) + '.png'
      },
      offer: {
        title: TITLES[i],
        address: chordX + ',' + chordY,
        price: getRandomInt(1000, 1000000),
        type: TYPES[getRandomInt(0, 3)],
        rooms: getRandomInt(1, 5),
        guests: getRandomInt(1, 10),
        checkin: CHECK_INS[getRandomInt(0, 2)],
        checkout: CHECK_OUTS[getRandomInt(0, 2)],
        features: shuffledFeatures.slice(0, getRandomInt(1, FEATURES_LENGTH)),
        description: '',
        photos: []
      },
      location: {
        chordX: chordX,
        chordY: chordY
      }
    };
  }
  return ads;
};

var getApartmentType = function (type) {
  var appartmentsType = {
    flat: 'Квартира',
    house: 'Дом',
    bungalo: 'Бунгало'
  };
  return appartmentsType[type];
};

var getFeaturesItems = function (features) {
  var fragment = document.createDocumentFragment();
  features.forEach(function (item) {
    var li = document.createElement('li');
    var featureClass = 'feature--' + item;
    li.classList.add('feature');
    li.classList.add(featureClass);
    fragment.appendChild(li);
  });
  return fragment;
};

var createLabelElement = function (label) {
  var labelElement = template.querySelector('.map__pin').cloneNode(true);
  labelElement.querySelector('img').src = label.author.avatar;
  labelElement.style.left = (label.location.chordX + LABEL_WIDTH / 2) + 'px';
  labelElement.style.top = (label.location.chordY + LABEL_HEIGHT) + 'px';
  return labelElement;
};

var createAdElement = function (ad) {
  var adElement = template.querySelector('.map__card').cloneNode(true);
  adElement.querySelector('h3').textContent = ad.offer.title;
  adElement.querySelector('h3+p').textContent = ad.offer.address;
  adElement.querySelector('.popup__price').textContent = ad.offer.price + '\u20bd/ночь';
  adElement.querySelector('h4').textContent = getApartmentType(ad.offer.type);
  adElement.querySelector('h4+p').textContent = ad.offer.rooms + ' для ' + ad.offer.guests + '  гостей';
  adElement.querySelector('p:nth-of-type(4)').textContent = 'Заезд после ' + ad.offer.checkin + ', выезд до ' + ad.offer.checkout;
  adElement.querySelector('.popup__features').innerHTML = '';
  adElement.querySelector('.popup__features').appendChild(getFeaturesItems(ad.offer.features));
  adElement.querySelector('p:nth-of-type(5)').textContent = ad.offer.description;
  adElement.querySelector('.popup__avatar').src = ad.author.avatar;
  return adElement;
};

var renderOffer = function (offer) {
  var fragment = document.createDocumentFragment();
  fragment.appendChild(createAdElement(offer));
  map.appendChild(fragment);
};

var renderMapItems = function () {
  nearByAds = generateNearbyAds(8);
  var fragment = document.createDocumentFragment();
  nearByAds.forEach(function (item) {
    fragment.appendChild(createLabelElement(item));
  });
  mapPins.appendChild(fragment);
};
