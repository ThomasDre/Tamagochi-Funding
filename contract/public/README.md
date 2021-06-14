# Connecting the frontend to your blockchain client
The web UI uses the web3.js WebsocketProvider for connecting to your blockchain client.
Therefore, you may adjust the address of the provider to your currently used client.
You can find the provider definition `new Web3.providers.WebsocketProvider("ws://localhost:8546")` in the file `/public/js/main.js`.
By default, the address points to your local Geth-client/the LVA-Chain.   
If you e.g. would like to use the UI with the truffle development blockchain, change the port to `9545`.


# Short UI overview
### Structure
The provided UI is based on JavaScript and jQuery.
jQuery is a JS library for simplifying HTML DOM tree traversal and manipulation.
The syntax for jQuery should be quite simple to understand and self-explanatory.

The UI's entry point is `index.html`. If you add further js-scripts, do not forget to
include them at the end of the file.

Under `/templates` you can find all HTML template files.  
`/img` contains some basic images used by the UI templates.

The directory `js` contains all JavaScript files.
- `main.js` is the main entry point. It first defines some utility functions e.g. for adding and removing templates, followed by
  the main function block for initializing the web3.js provider, connecting to your blockchain client and initializing the UI.
- Under `/detail` you can find further scripts for the different role-based UI-cards.
- `events.js` contains the event handling for your contract.
- `utils.js` contains some utility functions like `Handlebars.getTemplate(...)` for compiling the HTML templates.
- `abis.js` contains the ABI definitions for your contracts. Do not forget to update the ABIs if you change your contract interface.


### UI interaction
As already presented in the workshop, you have to type in the address of your bar contract into the header of the web UI to
connect to your deployed bar instance.
Then, additional addresses/users can be added via the corresponding field.
The address that created the bar contract, will also automatically recognized as `owner`.
Click on the different role cards to open a menu on the right side, with available role-based interaction possibilities.


# Run the frontend locally
If you would like to run the frontend locally instead of using the provided Gitlab-Pages instance, you have to
start a local web server.

Choose any of the following methods:

Python 3.x
----------

```
$ python -m http.server 8000
```

Python 2.x
----------

```
$ python -m SimpleHTTPServer 8000
```

Ruby
----

```
ruby -run -ehttpd . -p8000
```

Docker
------

```
docker run -d -p 8080:80 --name my-apache-app -v "$PWD":/usr/local/apache2/htdocs/ httpd:2.4-alpine
```

.. or use this list: https://gist.github.com/willurd/5720255
