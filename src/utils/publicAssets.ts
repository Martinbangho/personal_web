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
  const url = pathOrUrl instanceof URL ? pathOrUrl : new URL(pathOrUrl, publicDir);
  const relativePath = toPublicRelativePath(url);

  return withBase(prependForwardSlash(relativePath));
};
