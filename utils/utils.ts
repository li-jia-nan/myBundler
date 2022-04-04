import fs from 'fs';
import { PathLike } from 'fs';

class Utils {
  static searchFile = (inputPath: PathLike): PathLike[] => {
    const res: string[] = [];
    const readFileList = (path: PathLike) => {
      fs.readdirSync(path).forEach(file => {
        const stat = fs.statSync(path + file);
        if (stat.isDirectory()) {
          if (['node_modules'].some(item => file.includes(item))) {
            return;
          }
          readFileList(path + file + '/');
        } else {
          res.push(path + file);
        }
      });
    };
    const pathArr = (inputPath as string).split('/');
    pathArr.pop();
    const newPath = pathArr.join('/');
    readFileList(newPath + '/');
    return res;
  };
  static completePath = (path: PathLike): PathLike => {
    if (!['.js', '.ts', '.jsx', '.tsx'].some(item => (path as string).endsWith(item))) {
      const allFiles = this.searchFile(path);
      if (allFiles.length > 0) {
        const flieSuffix = ['.js', '.ts', '.jsx', '.tsx'].find(suffix =>
          allFiles.some(file => path + suffix === file)
        );
        if (flieSuffix) {
          path = (path as string) + flieSuffix;
        }
      }
    }
    return path;
  };
}

export default Utils;
