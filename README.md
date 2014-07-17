bluemix-service-switcher
================================================================================

A simple node app to show how to bind to services by name using the
[cfenv](https://www.npmjs.org/package/cfenv) package.

See the [hello-node](https://github.com/pmuellr/bluemix-hello-node) sample for
information about using node.js on IBM's [BlueMix](https://bluemix.net/) PaaS.


install
--------------------------------------------------------------------------------

From a command/shell terminal
* `cd` into the parent directory you want to install the project in
* `git clone` the project into a child directory
* `cd` into that child directory
* run `npm install` to install dependencies

For example:

    $ cd Projects
    $ git clone https://github.com/pmuellr/bluemix-service-switcher.git

        ... git output here ...

    $ cd bluemix-service-switcher

    $ npm install

        ... npm output here ...



run locally
--------------------------------------------------------------------------------

After installing, run the server using

    node server

This should see the following printed to the console.

    service-switcher: service info:
      isLocal?        - yes
      ServiceA bound? - no
      ServiceB bound? - no
      /Service?/      - (not bound)
    bound services:
      (none)
    service-switcher: server starting on http://localhost:<port>



running on Bluemix
--------------------------------------------------------------------------------

Before pushing the application to Bluemix, let's create some services that we'll bind
and unbind from the application.  We'll call them `ServiceA` and `ServiceB`.

From the command line, run the following two commands:

    cf cups ServiceA -p '{"serviceName": "A"}'
    cf cups ServiceB -p '{"serviceName": "B"}'

Now when you run `cf services`, you'll see `ServiceA` and `ServiceB`, along with
any other services you've created

You should also edit the `manifest.yml` file to change the `host` property to
a hostname that will be unique within the `mybluemix.net` domain.

Let's push the app without binding any services first.

    cf push

After this completes, run

    cf logs service-switcher --recent

At the end of the logs, you should see:

    service-switcher: service info:
      isLocal?        - no
      ServiceA bound? - no
      ServiceB bound? - no
      /Service?/      - (not bound)
    bound services:
      (none)
    service-switcher: server starting on https://<host>.mybluemix.net

From here on out, we won't be making any changes to the code, so we won't have
to run `cf push` anymore, we'll just be using `cf restart service-switcher` to
restart the app with different services bound.

To see the logs, open a new terminal window and run

    cf logs service-switcher

Keep that command running, and you'll see the messages from the server as it
restarts.

Let's bind ServiceA to the app, then restart the app:

    cf bind-service service-switcher ServiceA
    cf restart service-switcher

You should now see the following messages at the end of the log:

    service-switcher: service info:
      isLocal?        - no
      ServiceA bound? - yes
      ServiceB bound? - no
      /Service?/      - ServiceA
    bound services:
      user-provided: ServiceA: {"serviceName":"A"}

Let's bind ServiceB to the app, then restart the app:

    cf bind-service service-switcher ServiceB
    cf restart service-switcher

You should now see the following messages at the end of the log:

    service-switcher: service info:
      isLocal?        - no
      ServiceA bound? - yes
      ServiceB bound? - yes
      /Service?/      - ServiceA
    bound services:
      user-provided: ServiceA: {"serviceName":"A"}
      user-provided: ServiceB: {"serviceName":"B"}

Finally, let's unbind ServiceA from the app, then restart the app:

    cf unbind-service service-switcher ServiceA
    cf restart service-switcher

You should now see the following messages at the end of the log:

    service-switcher: service info:
      isLocal?        - no
      ServiceA bound? - no
      ServiceB bound? - yes
      /Service?/      - ServiceB
    bound services:
      user-provided: ServiceB: {"serviceName":"B"}
