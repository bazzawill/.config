!function fnDomainsIIFE(){var i=Okta._okta,o=i.isArray,t=i.map,n=Okta.fn.domains={};n.sitesToCustomDomain=function(i,n){return n&&n.oktaDomain&&n.customDomain&&o(i)?t(i,function(i){return i&&(i.siteURL&&0===i.siteURL.indexOf(n.oktaDomain)&&(i.siteURL=i.siteURL.replace(n.oktaDomain,n.customDomain)),i.ieSiteURL&&0===i.ieSiteURL.indexOf(n.oktaDomain)&&(i.ieSiteURL=i.ieSiteURL.replace(n.oktaDomain,n.customDomain))),i}):i},n.tabAppLinksToCustomDomain=function(i,n){return n&&n.oktaDomain&&n.customDomain&&o(i)?t(i,function(i){return i&&i.linkUrl&&0===i.linkUrl.indexOf(n.oktaDomain)&&(i.linkUrl=i.linkUrl.replace(n.oktaDomain,n.customDomain)),i}):i}}();