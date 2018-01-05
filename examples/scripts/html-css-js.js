{
  const example = new InlineCodeSuite({ 
    name: 'html-css-js',
    root: document.querySelector('html-css-js'), 
    height: 400,
    // useLocalStorage: false,
    editors: [
      {
        name: 'HTML',
        mode: 'htmlmixed',
        value: `
          <div id="sun">
            <div class="ring">
              <div class="box"></div>
              <div class="box"></div>
            </div>
            <div class="globe"></div>
            <div class="eyes">
              <div class="eye left-eye"></div>
              <div class="eye right-eye"></div>
            </div>
            <div class="mouth">
              <div class="lips"></div>
            </div>
          </div>
        `
      },
      {
        name: 'JS',
        mode: 'javascript',
        value: ''
      },
      {
        name: 'CSS',
        mode: 'css',
        value: `
          body {
            background: hsl(200, 100%, 90%);
            margin-top: 3rem;
          }

          #sun {
            position: relative;
            width: 300px;
            height: 300px;
            margin: auto;
          }

          #sun > div {
            position: absolute;
          }

          .globe {
            width: 66%;
            height: 66%;
            background: hsla(44, 100%, 60%, 1);
            border-radius: 50%;
            transform: translateX(25%) translateY(25%);
          }

          .ring {
            animation: spin 5s infinite linear;
            transform-origin: center center;
            width: 63%;
            height: 63%;
            left: 17.5%;
            top: 17.5%;
            text-align: center;
          }

          .box {
            background: hsla(44, 100%, 90%, 1);
            width: 100%;
            height: 100%;
            position: absolute;
            transform-origin: center center;
          }

          .box:first-child {
            transform: rotate(45deg);
          }

          .eyes {
            transform: translateX(73px) translateY(120px);
            position: absolute;
          }

          .eye {
            position: absolute;
            width: 30px;
            height: 30px;
            border-radius: 50%;
            background: rgba(0,0,0,0.5);
          }

          .right-eye {
            left: 120px;
          }

          .eye:nth-of-type(5) {
            transform: translateX(60vmin) translateY(47vmin);
          }


          .mouth {
            overflow: hidden;
            width: 200px;
            height: 30px;
            transform: translateX(62.5px) translateY(160px)
          }

          .lips {
            border-radius: 50%;
            width: 172px;
            height: 42px;
            border: 1vmin solid rgba(0,0,0,0.5);
            box-sizing: border-box;
            margin-top: -5vmin;
          }

          @keyframes spin {
            0% {
              transform: rotate(0deg);
            }
            100% {
              transform: rotate(359deg);
            }
          }
        `
      }
    ],
    scripts: [
      {
        type: 'text/javascript',
        value: 'const a = 7'
      }
    ],
    importScripts: ['scripts/importedScript.js']
  })
  
  // document.body.onkeypress = () => { console.log( example.getEditorData() ) }
}
