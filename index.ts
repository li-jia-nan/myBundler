import generateCode from './src/generateCode';

generateCode('./code/index.ts').then(code => {
  console.log(code);
});
