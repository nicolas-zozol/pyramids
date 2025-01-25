---
title: "What I wish I knew when starting Gatsby"
tags: ["gatsby", "javascript"]
lang: fr
date: "2020-09-07"
image: ../images/javascript.jpg
category: theory
---

Solid principles are important for writing maintainable code.

---

https://www.gatsbyjs.com/docs/page-query/



How does the graphql tag work?

graphql is a tag function. Behind the scenes Gatsby handles these tags in a particular way:
The short answer

During the Gatsby build process, GraphQL queries are pulled out of the original source for parsing.
The longer answer

The longer answer is a little more involved: Gatsby borrows a technique from Relay that converts your source code into an abstract syntax tree (AST) during the build step. file-parser.js and query-compiler.js pick out your graphql-tagged templates and effectively remove them from the original source code.

More information about how queries work is included in the Gatsby Internals section of the docs.


**This means that the graphql tag isn’t executed the way that JavaScript code is typically handled**
. For example, you cannot use expression interpolation with Gatsby’s graphql tag.
 **However, it’s possible to pass variables into page queries with the _context_ object when
  creating pages.**




