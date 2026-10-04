-- Run after schema.sql. Loads the current menu. Everything here is editable later from /admin/menu.

insert into menu_categories (name, slug, description, sort_order) values
 ('Appetizers','appetizers','Traditional starters',1),
 ('Main Courses','mains','Chicken, lamb, goat and shrimp curries',2),
 ('Vegetarian','vegetarian','All vegetarian entrees are $12.99',3),
 ('Momo','momo','Handmade Himalayan dumplings',4),
 ('Biryani','biryani','Basmati rice layered with spices',5),
 ('Rice & Noodles','rice-noodles','Indo-Chinese favorites',6),
 ('Naan','naan','Baked fresh in the tandoor',7),
 ('Desserts','desserts',null,8),
 ('Drinks','drinks',null,9);

insert into menu_items (category_id, name, description, price, options, sort_order)
select c.id, v.name, v.descr, v.price, coalesce(v.opts::jsonb, '[]'::jsonb), v.ord
from (values
 ('appetizers','Veggie Samosa','Pastries stuffed with seasoned potatoes and green peas, served with mint chutney',6.99,null,1),
 ('appetizers','Veg Pakora','Mixed vegetables in chickpea batter, deep fried, with tamarind sauce',6.99,null,2),
 ('appetizers','Himalayan Cauliflower','Crispy fried cauliflower tossed in sweet chilly garlic sauce',6.99,null,3),
 ('appetizers','Masala Wings','Deep fried chicken wings tossed in sweet chilly garlic sauce',9.99,null,4),
 ('appetizers','Chicken 65','Deep fried marinated chicken with curry leaves and green chillies',9.99,null,5),
 ('appetizers','Himalayan Delights Platter','Veg samosa, Himalayan cauliflower, veg pakora and fried veg momo',8.99,null,6),

 ('mains','Tikka Masala','Tender marinated meat in a rich, creamy tomato sauce',null,'[{"label":"Chicken","price":14.99},{"label":"Lamb/Goat","price":15.99},{"label":"Shrimp","price":16.99}]',1),
 ('mains','Butter Masala','Tender meat simmered in a velvety tomato and butter cream sauce',null,'[{"label":"Chicken","price":14.99},{"label":"Lamb/Goat","price":15.99},{"label":"Shrimp","price":16.99}]',2),
 ('mains','Korma','Fresh, tender meat simmered in a creamy onion sauce with aromatic spices',null,'[{"label":"Chicken","price":14.99},{"label":"Lamb/Goat","price":15.99},{"label":"Shrimp","price":16.99}]',3),
 ('mains','Coconut Curry','Tender meat simmered in coconut milk with spices and herbs',null,'[{"label":"Chicken","price":14.99},{"label":"Lamb/Goat","price":15.99},{"label":"Shrimp","price":16.99}]',4),
 ('mains','Chicken Chilly','Marinated fried chicken in homemade sweet chilly sauce. Indo-Chinese style',13.99,null,5),
 ('mains','Himalayan Chicken Curry','Boneless chicken cooked with tomato, ginger, garlic, onion and the chef''s own spices',13.99,null,6),
 ('mains','Himalayan Lamb/Goat Curry','Boneless lamb or bone-in goat in homemade curry with Himalayan spices',14.99,null,7),

 ('vegetarian','Veg Butter Masala','Mixed vegetables in a velvety tomato and butter cream sauce',12.99,null,1),
 ('vegetarian','Palak Paneer','Paneer cooked with spinach, herbs and spices',12.99,null,2),
 ('vegetarian','Matar Paneer','Paneer with green peas, tomato, onion, cream and spices',12.99,null,3),
 ('vegetarian','Chana Masala','Chickpeas simmered with tomatoes, onions and bold spices',12.99,null,4),
 ('vegetarian','Aalu Gobi Masala','Cauliflower and potato with ginger, tomato and spices',12.99,null,5),
 ('vegetarian','Paneer Tikka Masala','Paneer in a rich, creamy tomato sauce',12.99,null,6),
 ('vegetarian','Veg Coconut Curry','Mixed vegetables in coconut milk with spices and herbs',12.99,null,7),
 ('vegetarian','Gobi Manchurian','Crispy cauliflower in sweet chilly garlic sauce. Indo-Chinese style',12.99,null,8),

 ('momo','Veg Momo (Steamed)','Steamed dumplings filled with vegetables and spices, with spicy chutney',11.99,null,1),
 ('momo','Chicken Momo (Steamed)','Steamed dumplings filled with chicken and Himalayan spices',12.99,null,2),
 ('momo','Veg Momo (Fried)','Crispy fried vegetable dumplings',12.99,null,3),
 ('momo','Chicken Momo (Fried)','Crispy fried chicken dumplings',13.99,null,4),
 ('momo','Veg Momo (Chilli)','Vegetable dumplings tossed in homemade chilli sauce',13.99,null,5),
 ('momo','Chicken Momo (Chilli)','Chicken dumplings tossed in homemade chilli sauce',14.99,null,6),

 ('biryani','Veg Biryani','Basmati rice with vegetables, herbs and spices',13.99,null,1),
 ('biryani','Chicken Biryani','Basmati rice layered with chicken, spices and caramelized onions',14.99,null,2),
 ('biryani','Lamb/Goat Biryani','Biryani with tender lamb or goat and traditional spices',15.99,null,3),
 ('biryani','Shrimp Biryani','Shrimp with aromatic spices and basmati rice',16.99,null,4),

 ('rice-noodles','Veg Fried Rice','Stir-fried rice with vegetables, soy sauce and spices',12.99,null,1),
 ('rice-noodles','Chicken Fried Rice','Stir-fried rice with chicken, vegetables and savory sauces',12.99,null,2),
 ('rice-noodles','Veg Chowmein','Stir-fried noodles with vegetables, soy sauce and spices',11.99,null,3),
 ('rice-noodles','Chicken Chowmein','Stir-fried noodles with chicken and vegetables',12.99,null,4),

 -- Menu showed "$1.99+" for naan. Butter and garlic prices below are placeholders: confirm in /admin/menu.
 ('naan','Naan','Soft, fluffy bread baked in the tandoor',null,'[{"label":"Plain","price":1.99},{"label":"Butter","price":2.49},{"label":"Garlic","price":2.99}]',1),

 ('desserts','Gulab Jamun','Soft milk dumplings soaked in rose-flavored syrup',3.99,null,1),
 ('desserts','Coconut Balls','Coconut and condensed milk balls rolled in coconut flakes',3.99,null,2),
 ('desserts','Ras Malai','Soft cheese patties soaked in sweetened, thickened milk',3.99,null,3),

 ('drinks','Mango Lassi','Creamy yogurt drink with mango',3.99,null,1),
 ('drinks','Homemade Lemonade','Fresh squeezed, sweet and tart',2.99,null,2),
 ('drinks','Coke','',1.99,null,3),
 ('drinks','Diet Coke','',1.99,null,4),
 ('drinks','Dr Pepper','',1.99,null,5),
 ('drinks','Bottled Water','',1.49,null,6)
) as v(slug, name, descr, price, opts, ord)
join menu_categories c on c.slug = v.slug;

update menu_items set vegetarian = true
 where name ilike 'veg%' or name = 'Himalayan Cauliflower' or name = 'Himalayan Delights Platter'
    or category_id in (select id from menu_categories where slug in ('vegetarian','naan','desserts'));

update menu_items set featured = true
 where name in ('Tikka Masala','Veg Momo (Steamed)','Chicken Biryani','Palak Paneer','Veggie Samosa','Naan');
