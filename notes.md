# CS 260 Notes

This file represents what I have learned about web programming.

- [My startup](https://startup.cs260.click)
- [My simon](https://simon.cs260.click)

## Helpful links

- [Course instruction](https://github.com/webprogramming260)
- [Canvas](https://byu.instructure.com)
- [MDN](https://developer.mozilla.org)

## AWS

Interesting things I have learned about AWS

## HTML

Interesting things I have learned about HTML

It was really cool going through the MasteryLS course and I'm excited to work with it, but procrastinated way too much to take extensive notes.
 // (Post HTML phase) Oh my gosh I learned so much, still don't have the time to do this justice yet. I'll get back to it though. 

## CSS

Where: 
    - ideally in a separate .css file, <link rel="stylesheet" href="styles.css"> (inside <head>)

General Format:
    - body {
      font-family: Arial, sans-serif;
      [etc]
    }

Selectors (options):
    - element tags like body, p, footer, h1, section, etc
    - class selectors (.classname, like .summary)
    - id selectors (#physics)
    - attribute selectors (p[class='summary'])
    - and apparently pseudo-selectors like section:hover

Combinations examples (for selectors) 
    - "section h2" (all h2 descendants of sections)
    - section > p (any p that is a direct child of a section)
    - p.summary (all paragraphs with a summary)

Animation: 
    - animation-name (it's a name lol)
    - animation-duration (3s, )
    - animation-iteration-count (infinite, )
    - @keyframes (name) {
        to {opacity: 0;}
        50% {opacity: 1;}
        from {opacity: 0;}
    }

Apparently use the "viewport" tag if you don't want the browser to scale?

Use flex and grid to make the page responsive and to divide the page into sections (definitely using grid for the gameplay page)

## React

Interesting things I have learned about React