bluemix-service-switcher
================================================================================

A simple node app to show how to bind to services by name using the
[cfenv](https://www.npmjs.org/package/cfenv) package.

See the [hello-node](https://github.com/pmuellr/bluemix-hello-node) sample for
information about using node.js on IBM's [BlueMix](https://bluemix.net/) PaaS.


install
--------------------------------------------------------------------------------

From a command/shell terminal:

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
      /Service.*/     - (not bound)
    bound services:
      (none)

We'll be looking at this output again later, so here's a description of what
it's telling us:

* you are running locally, and not on Bluemix
* services `ServiceA` and `ServiceB` are not bound to this app
* there is no service matching the regular expression /Service.*/ bound to this
  app
* there are no bound services at all

We'll see these values change when we run the app on Bluemix, and change
the service bindings around.



running on Bluemix
--------------------------------------------------------------------------------

Before pushing the application to Bluemix, let's create some services that we'll bind
and unbind from the application.  We'll call them `ServiceA` and `ServiceB`.

From the command line, run the following two commands:

    cf cups ServiceA -p '{"serviceName": "A"}'
    cf cups ServiceB -p '{"serviceName": "B"}'

`cf cups` is short-hand for `cf create-user-provided-service`.  A user provided
service is a service like any other you can add to Bluemix, but you provide the
credentials properties.  In this case, just a single property `serviceName`.

User provided services are a great way to associate some kind of service which
is not currently provided by Bluemix, with your app.  You can access it the
exact same way you access real Bluemix services.

For more info on user provided services, see the documentation
[User-Provided Service Instances](http://docs.gopivotal.com/pivotalcf/devguide/services/user-provided.html).

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
      /Service.*/     - (not bound)
    bound services:
      (none)

Still no services bound, but `isLocal?` says `no` now,
indicating this application is running on Bluemix.

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
      /Service.*/     - ServiceA
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
      /Service.*/     - ServiceA
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
      /Service.*/     - ServiceB
    bound services:
      user-provided: ServiceB: {"serviceName":"B"}

how it works
--------------------------------------------------------------------------------

The app uses the [cfenv](https://www.npmjs.org/package/cfenv) package
to get application environment information from Bluemix, and provides
JavaScript functions to easily access it.

It all starts in the `server.js` file, by getting an `appEnv` object:

    var AppEnv = cfenv.getAppEnv()

Later on in that file, you can see properties being access and methods being
invoked on that `AppEnv` object:

* `AppEnv.isLocal` - a boolean value, indicating whether the app is running
  locally (`true`) or on Bluemix (`false`)

* `AppEnv.getService("ServiceA")` - retrieves a service named `ServiceA`

* `AppEnv.getService(/Service.*/)` - retrieves a service whose name matches the
  specified regular expression `/Service.*/`; in this case, it's a service whose
  name starts with `Service`, so it will match `ServiceA` or `ServiceB`.

* `AppEnv.getServices()` - retrieves all the services, returned in an object
  whose keys are the service names, and values are the service objects.

The service objects come right from your `VCAP_SERVICES` environment variable,
and so will look something like this, for `ServiceB`:

    {
      "name": "ServiceB",
      "label": "user-provided",
      "credentials": {
        "serviceName": "B"
      }
    }


`cfenv` has a number of other properties and methods available, providing all
the information available in the environment variables `VCAP_APPLICATION` and
`VCAP_SERVICES`.  Check the doc for more information.

The regular expression mapping of services can be very useful to allow your
application to bind to different instances of services, for testing purposes.
For instance, I recently built an app that I wanted to test with both a
paid up service, and a free one.  I used the `getService()` method with a
regular expression like `/my-service.*`, and then I had the paid up service
named `my-service-paid` and the free one `my-service-free`.  By just changing
which one was bound to my app, I was able to test the two different services.
**No code changes!! No need to repush!! Just restart the app!!**

And more importantly, no `JSON.parse(process.env.VCAP_SERVICES)`.  :-)
