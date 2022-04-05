import path from 'path';
import fs, { PathLike } from 'fs';
import utils from '../utils/utils';
import traverse from '@babel/traverse';
import { parse } from '@babel/parser';
import { transformFromAst } from '@babel/core';

const moduleAnalyser = (fileName: PathLike): Promise<AnalyserType> => {
  const entry = utils.completePath(fileName);
  const content = fs.readFileSync(entry, 'utf8');
  const ast = parse(content, { sourceType: 'module' });
  const dependencies: Record<PropertyKey, string> = {};
  traverse(ast, {
    ImportDeclaration({ node }) {
      const dirname = path.dirname(entry as string);
      const newFile = './' + path.join(dirname, node.source.value);
      Reflect.set(dependencies, node.source.value, newFile.replace(/\\/g, '/'));
    },
  });
  return new Promise<AnalyserType>(resolve => {
    transformFromAst(ast, null, { presets: ['@babel/preset-env'] }, (err, result) => {
      if (err) {
        resolve({ fileName, dependencies, code: '' });
      }
      resolve({ fileName, dependencies, code: result.code });
    });
  });
};

export default moduleAnalyser;
