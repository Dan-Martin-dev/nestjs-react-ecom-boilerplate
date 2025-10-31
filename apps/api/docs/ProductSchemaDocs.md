You should absolutely use your current schema. It is perfectly designed for this exact scenario and is considered the best practice.

Creating 4 different products would be simpler for the frontend at first, but it would create a data management nightmare for you in the long run.

Here’s how to achieve your goal with your current, powerful schema:

The Correct Approach: One Product, Many Variants
Create One Base Product: You will have only one Product record in your database for "HEAVYWEIGHT TEE". This product holds the common description, categories, etc.

Create Variants for Each Color & Size: You will create 16 ProductVariant records (4 colors x 4 sizes).

Each variant will have a unique slug and sku, for example:
heavyweight-tee-red-s
heavyweight-tee-red-m
heavyweight-tee-blue-s
etc.
Each variant is linked to its specific color and size attributes.
How to Create 4 Different Product Detail Pages
The "magic" happens in your frontend application's routing and data fetching logic, not in the database structure.

Group by a Primary Attribute (Color): Think of "Color" as the primary way to group your variants. Your frontend will present each color group as a distinct page.

Frontend Routing: Your URLs can be structured to reflect this grouping. For example:

/products/heavyweight-tee (Main page, maybe defaults to the first color)
/products/heavyweight-tee?color=red (A page for the red version)
/products/heavyweight-tee?color=blue (A page for the blue version)
Data Fetching on the Page: When a user navigates to the "red" version's page:

Your frontend fetches the single "HEAVYWEIGHT TEE" product, but it also fetches all 16 of its variants.
The page then filters this list to show only the variants where the color attribute is "Red".
You will be left with 4 variants (Red/S, Red/M, Red/L, Red/XL) to display as size options.
Display Logic:

Page Title: Can be dynamically set to "HEAVYWEIGHT TEE - RED".
Main Image: Display the image associated with the red variants.
Size Selector: The buttons for S, M, L, XL will be rendered from the 4 filtered variants.
Color Swatches: The other color options (blue, black, green) will be links that change the color query parameter in the URL, causing the page to re-filter and display the variants for the newly selected color.
Why Creating 4 Separate Products is a Bad Idea
Data Duplication: You would have to copy the description, categories, and other details for every single color. If you need to fix a typo, you have to edit 4 different products.
Maintenance Hell: Adding a new color would mean creating an entirely new product and all its size variants.
Incorrect Relationships: It becomes very difficult to link the "Red" product to the "Blue" product to show customers that other colors are available. With your current schema, this is trivial because they are all variants of the same parent product.
Conclusion: Your current schema is professional, scalable, and correct. Stick with it. The work to create the user experience you want is a standard and expected task for the frontend application.