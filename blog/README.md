# Blog (v2)

The blog is intentionally not part of v1. The planned v2 will publish one post per solved data problem, authored in Markdown and rendered to static HTML by a small build script. Posts will include topic tags, estimated reading time and an RSS feed.

Keep the site's reusable header and footer as the shared markup and styling in `index.html` and `css/components.css`; a future blog template can reuse those structures and load the same local styles and assets. Site-wide paths should remain relative so the blog also works under the GitHub Pages project-site path.
