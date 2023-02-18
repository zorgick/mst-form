# MST-utils-components

Forms with MST prototype (v1)

## Two cases

I. Each Select field depends on the previous:
Steps:

1. Select Meme 3, skim over options, do not choose anything
2. Select any option from Meme 2 -> Meme 3 resets selection and changes it's options in a second (explicit timeout, aka async fetch).
3. Select and option from Meme 1 -> Meme 2 resets selection and changes its options, Meme 3 resets selection and disable unless Meme 2 has value.

I. All Select fields depends on the first one:

1. Coment lines 287,288 in viewModal.js, uncomment 291-293
2. Select and option from Meme 1 -> Meme2 and Meme3 reset selection and change their options. Both are ready for selection
