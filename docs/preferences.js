(() => {
  let saved={};try{saved=JSON.parse(localStorage.getItem('den9911:portfolio'))??{};}catch{}
  const choice=['light','dark','system'].includes(saved.theme)?saved.theme:'system';
  const theme=choice==='system'?(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):choice;
  document.documentElement.dataset.theme=theme;
  document.documentElement.lang=['en','ru'].includes(saved.language)?saved.language:'en';
  document.documentElement.style.colorScheme=theme;
})();
