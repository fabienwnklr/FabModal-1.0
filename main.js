import FabWindow from './src/js/FabWindow.js'

document.addEventListener('DOMContentLoaded', function(){
  window.myWindow = new FabWindow({
    // bodyContent: `Lorem ipsum dolor sit amet consectetur adipisicing elit. Ratione quasi non 
    //               recusandae maiores? Enim quidem nemo ad cumque delectus 
    //               molestiae nam ea excepturi, qui autem, mollitia omnis saepe maiores fuga!`,
    footerContent : `<button>Valider</button>` 
  }); 
    document.querySelector('.fab-window').addEventListener('fabWindowClose', function(){ 
      console.log('closed');
    })
})

document.querySelector('button').addEventListener('click', function(){
  new FabWindow()
})

