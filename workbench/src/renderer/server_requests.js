import { ipcMainChannels } from '../main/ipcMainChannels';

const { logger, LANGUAGE } = window.Workbench;
const { ipcRenderer } = window.Workbench.electron;

const HOSTNAME = 'http://127.0.0.1';
const PREFIX = 'api';
const CORE_PORT = await ipcRenderer.invoke(ipcMainChannels.GET_SETTING, 'core.port');


async function getPort(modelName) {
  let port;
  const type = await ipcRenderer.invoke(
    ipcMainChannels.GET_SETTING, `models.${modelName}.type`);
  if (type === 'core') {
    port = await ipcRenderer.invoke(
      ipcMainChannels.GET_SETTING, 'core.port');
  } else {
    port = await ipcRenderer.invoke(
      ipcMainChannels.GET_SETTING, `models.${modelName}.port`);
  }
  return port;
}

// The Flask server sends UTF-8 encoded responses by default
// response.text() always decodes the response using UTF-8
// https://developer.mozilla.org/en-US/docs/Web/API/Body/text
// response.json() doesn't say but is presumably also UTF-8
// https://developer.mozilla.org/en-US/docs/Web/API/Body/json


/**
 * Get the MODEL_SPEC dict from an invest model as a JSON.
 *
 * @param {string} payload - model name as given by `invest list`
 * @returns {Promise} resolves object
 */
export async function getSpec(modelName) {
  const port = await getPort(modelName);
  return (
    window.fetch(`${HOSTNAME}:${port}/${PREFIX}/getspec?language=${LANGUAGE}`, {
      method: 'post',
      body: JSON.stringify(modelName),
      headers: { 'Content-Type': 'application/json' },
    })
      .then((response) => response.json())
      .catch((error) => logger.error(error.stack))
  );
}

export async function fetchArgsEnabled(payload) {
  console.log(payload);
  const port = await getPort(modelName);
  return (
    window.fetch(`${HOSTNAME}:${port}/${PREFIX}/args_enabled`, {
      method: 'post',
      body: JSON.stringify(payload),
      headers: { 'Content-Type': 'application/json' },
    })
      .then((response) => response.json())
      .catch((error) => {
        logger.error(error.stack);
        // In practice this function is debounced, so there's a case (tests)
        // where it is not called until after the flask app was killed.
        // So instead of letting it return undefined, return the expected type.
        return [];
      })
  );
}

/**
 * Send invest arguments to a model's validate function.
 *
 * @param {object} payload {
 *   model_module: string (e.g. natcap.invest.carbon)
 *   args: JSON string of InVEST model args keys and values
 * }
 * @returns {Promise} resolves array
 */
export async function fetchValidation(payload) {
  console.log(payload);
  const port = await getPort(modelName);
  return (
    window.fetch(`${HOSTNAME}:${port}/${PREFIX}/validate?language=${LANGUAGE}`, {
      method: 'post',
      body: JSON.stringify(payload),
      headers: { 'Content-Type': 'application/json' },
    })
      .then((response) => response.json())
      .catch((error) => {
        logger.error(error.stack);
        // In practice this function is debounced, so there's a case (tests)
        // where it is not called until after the flask app was killed.
        // So instead of letting it return undefined, return the expected type.
        return [];
      })
  );
}

/**
 * Load invest arguments from a datastack-compliant file.
 *
 * @param {string} payload - path to file
 * @returns {Promise} resolves undefined
 */
export function fetchDatastackFromFile(payload) {
  return (
    window.fetch(`${HOSTNAME}:${PORT}/${PREFIX}/post_datastack_file`, {
      method: 'post',
      body: JSON.stringify(payload),
      headers: { 'Content-Type': 'application/json' },
    })
      .then((response) => response.json())
  );
}

/**
 * Get a list of the column names of a vector file.
 *
 * @param {string} payload - path to file
 * @returns {Promise} resolves array
 */
export function getVectorColumnNames(payload) {
  return (
    window.fetch(`${HOSTNAME}:${CORE_PORT}/${PREFIX}/colnames`, {
      method: 'post',
      body: JSON.stringify({ vector_path: payload }),
      headers: { 'Content-Type': 'application/json' },
    })
      .then((response) => response.json())
      .catch((error) => logger.error(error.stack))
  );
}

/**
 * Write invest model arguments to a python script.
 *
 * @param  {object} payload {
 *   filepath: string
 *   modelname: string (e.g. carbon)
 *   args_dict: JSON string of InVEST model args keys and values
 * }
 * @returns {Promise} resolves undefined
 */
export function saveToPython(payload) {
  return (
    window.fetch(`${HOSTNAME}:${PORT}/${PREFIX}/save_to_python`, {
      method: 'post',
      body: JSON.stringify(payload),
      headers: { 'Content-Type': 'application/json' },
    })
      .then((response) => response.text())
      .then((text) => {
        logger.debug(text);
        return text;
      })
      .catch((error) => logger.error(error.stack))
  );
}

/**
 * Archive invest model input data.
 *
 * @param  {object} payload {
 *   filepath: string
 *   moduleName: string (e.g. natcap.invest.carbon)
 *   args_dict: JSON string of InVEST model args keys and values
 * }
 * @returns {Promise} resolves undefined
 */
export function archiveDatastack(payload) {
  return (
    window.fetch(`${HOSTNAME}:${PORT}/${PREFIX}/build_datastack_archive`, {
      method: 'post',
      body: JSON.stringify(payload),
      headers: { 'Content-Type': 'application/json' },
    })
      .then((response) => response.text())
      .then((text) => {
        logger.debug(text);
        return text;
      })
      .catch((error) => logger.error(error.stack))
  );
}

/**
 * Write invest model arguments to a JSON file.
 *
 * @param  {object} payload {
 *   filepath: string
 *   moduleName: string (e.g. natcap.invest.carbon)
 *   args: JSON string of InVEST model args keys and values
 *   relativePaths: boolean
 * }
 * @returns {Promise} resolves undefined
 */
export function writeParametersToFile(payload) {
  return (
    window.fetch(`${HOSTNAME}:${CORE_PORT}/${PREFIX}/write_parameter_set_file`, {
      method: 'post',
      body: JSON.stringify(payload),
      headers: { 'Content-Type': 'application/json' },
    })
      .then((response) => response.text())
      .then((text) => {
        logger.debug(text);
        return text;
      })
      .catch((error) => logger.error(error.stack))
  );
}

/**
 * Get the mapping of supported language codes to display names.
 *
 * @returns {Promise} resolves object
 */
export async function getSupportedLanguages() {
  return { en: 'English' };
  // return (
  //   window.fetch(`${HOSTNAME}:${CORE_PORT}/${PREFIX}/languages`, {
  //     method: 'get',
  //   })
  //     .then((response) => response.json())
  //     .catch((error) => logger.error(error.stack))
  // );
}
