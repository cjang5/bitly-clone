#Bitly Front End Engineer Intern Exercise
*Hello Bitly crew!*

## Intro
So, I had a **TON** of fun with this challenge, so thank you, first and foremost, for that.
I did take a bit (ok a lot) longer than specified, but that's because I was trying my
best to get it as close as I could to the provided comps and to the actual Bitly website.

## Stuff I Used
It was pretty vanilla, I used jQuery, and I decided to use a new framework called
[Bulma.io](http://bulma.io) which is quite similar to Twitter Bootstrap, so that was fun.
I considered using Sass for the cleanliness, but I'm too tired at this point. :)

## Setup
Just unzip the package I included, and in there you should see **api_key_include.js** in the **js/**
directory. Just go ahead and fill in the login and apiKey info there and it should work
when you fire up the app.

### The Good
I managed to get a lot of features replicated like:
 + Highlighting the text form
 + Having the button say "COPY" when the contents of the url bar match the most
   recently created Bitlink, EXCEPT when the contents are completely erased. Then,
   we go back to saying "SHORTEN". (This one was annoying)
 + Pasting a link into the bar automatically triggers "shortening" behavior

### The Bad
 + So I kind of got some kind of persistent session thing going, although it is a bit
   shaky. I was struggling with asynchronous loading of the Bitlinks and so sometimes
   links won't appear on refresh, or will appear in the wrong order, so sorry about that!
 + On mobile, I just forced the grid system with the framework I was using (Bulma.io)
   to the desktop layout, so it isn't the most optimal mobile experience, but it does
   work (to some degree). If I had more time I'd make it way better.
 + I also couldn't figure out how to add the 'X' link to clear the url-form.

### Notes
 + I changed the background-image.png to a .jpg to increase load times
 + I couldn't find easy ways of replicating your guys' notification/copy-link-press-and-the-link-floats-up-and-fades mechanism
   so I used my own spin on it. I used Bulma's notification system to just fade in
   some nice little notifications with info for the user.
 + I also couldn't find an easy way of creating your guys' slide down transition for
   the Bitlink history, so I just faded mine in ;).
 + I made the orange Bitlink copy to clipboard as you guys specified in the Optional requirements
 + I made all the other links open the destination in a new tab
 + Regarding persistent sessions, see **The Bad**, above.
 + I also added functionality where if you press Enter/Return right after shortening a link,
   you can press Enter/Return again to Copy it right away. :)
 + Also the logo.svg you guys provided was kinda wonky in that the holes in the "b" and "y" were
   filled in so it took me a couple hours in Adobe Illustrator to remove that (it didn't work in Sketch for some reason).

 # TL;DR
 I had a lot of fun with the exercise, and would love to move on to the next step with you guys.
 Also, you guys have ***beautiful*** UX. It made me go "wow" and only made me more
 excited to try to replicate Bitly.

 Cheers!
 
 [Chris Jang](http://chrisjang.com)
