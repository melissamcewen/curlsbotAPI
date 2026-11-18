# The Styler Project

Currently my CurlsBot API database divides styling products into several categories the most common being
- Creams
- Gels

I'd love to collapse them all into one category called "stylers"

The problem here is Creams, because some are stylers and some aren't
- they are always leave-in conditioners
- but only some have styling polymers

So some creams would be classified as leave-ins and others as stylers

I want to build an extension that does this automatically. I believe the key is making sure I have all the known styling polymers in my ingredients database and properly tagged them.

I'll also need to do updates on the front end because it will break my routine builder. 
