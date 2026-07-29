# Pyramid v2

Pyramid is a failed project. The ambition was to expose reusable work from packages into industrializable websites, mostly SEO websites with customized components

The v2 aims at restarting the project, leveraging AI


Business rule: we still go with Vercel, with React server components
Business rule: we simplify seo urls to make some easy parsing
Business rule: The v2 starts with building only the robusta website
Business rule: intel analytics tool is not used

## Blogging

### Seo url simplification

Url simplification :
- with /blog/c/{category}/
- when there is a locale, use /l/{locale}/
- page must be a query param: /blog/c/{category}?page=12&size=20
- replace 'learn' with 'articles'

### Content sources

I was using pure markdown as the source of content. I still think it's a good first source, but I wonder if the server was rebuilding from markdown too often. This must be analysed


## Claude Design System

Pyramids can build multiple seo sites, reusing:
- Vercel and RSC backbone
- website structure patterns
- layouts, ctas, analytics libs

And on top of that, each site will have its own Design System with design tokens, given by Claude Design (https://claude.com/product/design)
The robusta website has packages/robusta-design-system ; other web sites have others. For the moment, we build only the robusta website 

## Refactoring robusta website

The website (apps/robusta) is a thrash, we start from scratch at apps/robusta-build

- We will expose the content of the blog only from  apps/robusta/public/learn ; we probably DONT need images from apps/robusta/public/images.


## Robusta landing page

The robusta website must have a nice landing page using the design system, but reusing the previous content. However, we won't show the resume which is obsolete

## SEO Excellence

Everything must go toward SEO best practice, not being too aggressive though.