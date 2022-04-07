import path from 'path';
import fs, { PathLike } from 'fs';
import utils from '../utils/utils';
import traverse from '@babel/traverse';
import { parse } from '@babel/parser';
import { transformFromAstSync } from '@babel/core';
import { AnalyserType } from '../types';

const moduleAnalyser = (fileName: PathLike): AnalyserType => {
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
  const { code = '' } = transformFromAstSync(ast, null, { presets: ['@babel/preset-env'] });
  return { fileName, dependencies, code };
};

export default moduleAnalyser;
