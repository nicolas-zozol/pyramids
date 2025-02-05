// VERY IMPORTANT: DO NOT CHANGE SLUGIFY IMPLEMENTATION
// Or you could have to redirect all the pages in the website
// Slugify npm package is set at version 1.6.6
import slugify from 'slugify';

export const immutableSlugify = function (text: string, locale: string) {
  return slugify(text, {
    lower: true,
    strict: true,
    locale,
  });

  // Alternatively, you can opt for the simpler internalSlugify function
  // Not recommended, especially with non latin languages
  // return internalSlugify(text);
};

function internalSlugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .replace('è', 'e')
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w-]+/g, '') // Remove all non-word chars
    .replace(/--+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, ''); // Trim - from end of text
}
