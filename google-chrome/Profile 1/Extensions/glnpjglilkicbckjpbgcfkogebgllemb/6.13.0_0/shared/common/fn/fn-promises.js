!function FnPromisesIIFE(){var r=Okta.Q,n=Okta._okta,t=n.reduce,e=n.rest,f=Okta.Q.when,u=Okta.fn.base.curry2,i=Okta.fn.base.curry3,o=Okta.fn.base.splat,c=n.toArray,a=Okta.Q.defer,s=Okta.fn.promises={};s.pipelineP=function(n){return t(e(arguments),f,n)},s.composeP=function(){var t=c(arguments).reverse();return t[0]=o(t[0]),function(){var n=c(arguments);return t.unshift(n),s.pipelineP.apply(this,t)}},s.tapP=u(function(n,t){return f(n(t),function(){return t})}),s.fmapObjectP=i(function(t,n,r){return f(n(r[t]),function(n){return r[t]=n,r})}),s.pollP=function(n,e,u){var t=a();return function i(t,r){f(t(),function(n){e(n)?r.resolve(n):setTimeout(function(){i(t,r)},u)},function(n){r.reject(n)})}(n,t),t.promise},s.filterP=function(n,t){return r.all(t.map(n)).then(function(r){return t.filter(function(n,t){return!!r[t]})})},s.rejectIfFalse=function(n){return n||r.reject()},s.runIfTrue=u(function(n,t){return t&&n(t)})}();