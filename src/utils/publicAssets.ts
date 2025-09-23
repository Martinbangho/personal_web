import { prependForwardSlash, withBase } from './paths';

const publicDir = new URL('../../public/', import.meta.url);

const toPublicRelativePath = (url: URL) => {
  const { pathname } = url;
  const basePath = publicDir.pathname;

  if (!pathname.startsWith(basePath)) {
    throw new Error(`Asset ${pathname} is not inside the public directory.`);
  }

  return pathname.slice(basePath.length);
};

export const resolvePublicAsset = (pathOrUrl: string | URL) => {
  const relativePath =
    typeof pathOrUrl === 'string' ? pathOrUrl : toPublicRelativePath(pathOrUrl);

  return withBase(prependForwardSlash(relativePath));
};
