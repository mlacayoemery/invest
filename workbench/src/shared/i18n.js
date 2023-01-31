import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import es_messages from './es.json';
import zh_messages from './zh.json';

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources: {
      es: {
        translation: es_messages
      },
      zh: {
        translation: zh_messages
      },
    },
    lng: 'es',
    interpolation: {
      escapeValue: false // react already safes from xss
    },
    saveMissing: true,
  }).then(function(t) { console.log(t('Open')); });

export default i18n;
