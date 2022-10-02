Okta.StorageBase=function(t,e){var u={},r=Okta.StorageMultiAccount(u),a=Okta._okta,i=a.partial,n=a.each,l=Okta.fn.base.keyToCamelCase,d=Okta.fn.base.orDefault,A=Okta.fn.promises.composeP,k={Session:{get:t.getSessionState,set:t.setSessionState},Persistent:{get:t.getPersistentState,set:t.setPersistentState,remove:t.removePersistentState},Tab:{get:t.getTabState,set:t.setTabState,update:t.updateTabState}};n(e,function(t){!function s(t){var e=k[t.type];if(e){var a=t.name||l(t.key),n=e.set,c=e.get,o=e.update;n&&c&&(t.multiAccount&&(r.addMultiAccountMethods(e,a,t),n=r.makeMultiAccountKey(e.set),c=r.makeMultiAccountKey(e.get)),u["get"+a]=A(d(t.def),i(c,t.key,undefined)),u["set"+a]=i(n,t.key),u["clear"+a]=i(n,t.key,t.def),o&&(u["update"+a]=i(o,t.key)))}else Log.warn("StorageBase::not supported storage type: "+t.type)}(t)});var c=u.setAllowListedOktaAccounts;return u.setAllowListedOktaAccounts=function(t){return r.setAllowListedOktaAccounts(t),c&&c(t)},u.readMultiAccount=r.readMultiAccount,u.getCurrentAccountIndex=r.getCurrentAccountIndex,u.setCurrentAccountIndex=r.setCurrentAccountIndex,u.clearAccountData=r.clearAccountData,u.copyMultiAccountData=r.copyMultiAccountData,u};