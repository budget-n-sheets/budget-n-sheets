/**
 * Copyright (c) 2019 Guilherme T Maeoka
 * This code is licensed under MIT license.
 * <https://github.com/guimspace/gas-common>
 */

/**
 * Gets the value associated with the given key in the current Properties store, or null if no such key exists.
 * @param  {String} method The method to get a property store
 * @param  {String} key    The key for the property
 * @param  {String} type   The type of the value to return
 * @return {Object}        The value associated with the given key in the current Properties store
 */
function getPropertiesService_(method, type, key) {
  var m_Properties;


  switch(method) {
    case 'document':
      m_Properties = documentPropertiesService_;
      break;
    case 'script':
      m_Properties = scriptPropertiesService_;
      break;
    case 'user':
    default:
      m_Properties = userPropertiesService_;
      break;
  }

  switch(type) {
    case 'number':
      return Number( m_Properties.getProperty(key) );
    case 'string':
      return m_Properties.getProperty(key);
    case 'boolean':
      if(m_Properties.getProperty(key) === 'true') return true;
      else return false;
    case 'json':
      var p = m_Properties.getProperty(key);
      if(typeof p === 'string') return JSON.parse( p );
      else return;
    default:
      return;
  }
}

/**
 * Sets the given key-value pair in the current Properties store.
 * @param  {String} method The method to get a property store
 * @param  {String} key    The key for the property
 * @param  {String} type   The type of the value to convert
 * @param  {Object} value  The value to associate with the key
 */
function setPropertiesService_(method, type, key, value) {
  var m_Properties;


  switch(method) {
    case 'document':
      m_Properties = documentPropertiesService_;
      break;
    case 'script':
      m_Properties = scriptPropertiesService_;
      break;
    case 'user':
    default:
      m_Properties = userPropertiesService_;
      break;
  }

  switch(type) {
    case 'number':
      m_Properties.setProperty(key, value.toString());
      break;
    case 'string':
      m_Properties.setProperty(key, value);
      break;
    case 'boolean':
      if(value) m_Properties.setProperty(key, 'true');
      else m_Properties.setProperty(key, 'false');
      break;
    case 'json':
      m_Properties.setProperty(key, JSON.stringify( value ));
    default:
      break;
  }
}

/**
 * Purges all key-value pairs in specific or all Properties store.
 * @param  {String} method The method to get a property store
 */
function purgePropertiesService_(method) {
  switch(method) {
    case 'document':
      documentPropertiesService_.deleteAllProperties();
      break;
    case 'script':
      scriptPropertiesService_.deleteAllProperties();
      break;
    case 'user':
      userPropertiesService_.deleteAllProperties();
      break;
    default:
      documentPropertiesService_.deleteAllProperties();
      scriptPropertiesService_.deleteAllProperties();
      userPropertiesService_.deleteAllProperties();
      break;
  }
}
