export const removeArraysRecursive = ( foo ) => {
  let bar = {}

  for ( let key in foo ) {
    if ( !foo.hasOwnProperty( key ) ) continue
    else if ( Array.isArray( foo[ key ] ) ) {
      //bar[ key + ' (array)' ] = `Array with ${ foo[key].length } elements`
    } else if ( typeof foo[ key ] === 'object' && foo[ key ] !== null ) {
      bar[ key ] = removeArraysRecursive( foo[ key ] )
    } else {
      bar[ key ] = foo[ key ]
    }
  }
  return bar
}

export const getStructuralArrPropKeys = ( foo ) => {
  let bar = {}

  for ( let key in foo ) {
    if ( !foo.hasOwnProperty( key ) ) continue
    else if ( Array.isArray( foo[ key ] ) ) {
      bar[ key ] = `Array with ${ foo[key].length } elements`
    } else if ( typeof foo[ key ] === 'object' && foo[ key ] !== null ) {
      bar[ key ] = getStructuralArrPropKeys( foo[ key ] )
    }
  }
  return bar
}

export const getTokenMSAL = async ( { clientId, authority, loginRequest } ) => {
  // TODO: THIS CANNOT BE CALLED MULTIPLE TIMES!!!
  // DEPENDS ON LOCAL STORAGE TO PROPERLY OBTAIN CLIENTID
  var userAgent = new Msal.UserAgentApplication( {
    auth: {
      clientId: clientId,
      authority: authority,
      redirectUri: window.location.origin + "/msal.html"
    },
    cache: {
      cacheLocation: "localStorage",
      storeAuthStateInCookie: true
    },
  } )

  var token = await userAgent.getCachedToken( clientId )

  if ( token )
    return token.accessToken

  try {
    token = await userAgent.acquireTokenSilent( loginRequest )
  } catch ( e ) {
    console.log( 'MSAL Error: ' + e.errorCode )
    if ( e.errorCode === "user_login_error" ) {
      window.localStorage.msalClientId = clientId
      await userAgent.loginPopup( loginRequest )
      delete window.localStorage.msalClientId
      return await getTokenMSAL( { clientId: clientId, authority: authority, loginRequest: loginRequest } )
    } else if ( e.errorCode === "token_renewal_error" ) {
      window.localStorage.msalClientId = clientId
      token = await userAgent.acquireTokenPopup( loginRequest )
      delete window.localStorage.msalClientId
    }
  }

  return token.accessToken
}
