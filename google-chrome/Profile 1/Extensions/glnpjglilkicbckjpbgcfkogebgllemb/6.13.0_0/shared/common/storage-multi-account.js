Okta.StorageMultiAccount=function(o){var n={},r=Okta.Q,i=Okta._okta,u=i.find,a=i.partial,c=i.map,f=Okta.fn.base.orDefault,l=Okta.fn.promises.composeP,e=!1,A=-1,d=[];function s(n){return"setAcc"+n}function k(n){return"getAcc"+n}function g(n){return"removeAcc"+n}function O(n,t){return 0<=t?n+"_"+t:n}function m(n,t,u,e){return n(O(t,u),e)}function p(n){if(!e)return-1;var t=u(n,function(n){return n.isCurrentAccount});return t?t.index:-1}function y(u,e){return o.getAllowListedOktaAccounts().then(function(n){var t=c(n,function(t){return t.index<0?r():u(O(e,t.index)).then(function(n){return{data:n,account:t}})});return r.all(t)})}return n.makeMultiAccountKey=function(u){return function(n,t){return u(O(n,A),t)}},n.addMultiAccountMethods=function(n,t,u){var e=n.set,r=n.get,c=n.remove;d.push(t),o[k(t)]=l(f(u.def),a(m,r,u.key)),o[s(t)]=a(m,e,u.key),o["getAll"+t]=a(y,r,u.key),o[g(t)]=c?a(m,c,u.key):a(m,e,u.key,i,u.def===undefined?null:u.def)},n.getCurrentAccountIndex=function(){return A},n.setCurrentAccountIndex=function(n){A=n},n.setAllowListedOktaAccounts=function(n){A=p(n)},n.readMultiAccount=function(){return r.all([o.getDBGPluginSettings(),o.getAllowListedOktaAccounts()]).spread(function(n,t){e=n&&n.multiAccountAwarePlugin,A=p(t)})},n.clearAccountData=function(t){return r.all(c(d,function(n){return o[g(n)](t)}))},n.copyMultiAccountData=function(t,u){return r.all(c(d,function(n){return function e(n,t,u){return o[k(n)](t).then(a(o[s(n)],u))}(n,t,u)}))},n};