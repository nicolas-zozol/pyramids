Score scraper
====

Objective:

benefit from deep multibook websocket advantage. Check if pricing is a benefit

- depth = D, gradient = G
- while check all books 
- if all books > 0 && allbooks.score > X  goto buy


buy:

while (true && wait 500)

cut loses
    - if price < buyPrice*0.99 then sell

sell at good price
    - if  price > buyPrice*1.02 && !(all books > 0) || allbooks.score < Y  goto sell

