// Licensed under the Apache License. See footer for details.

var cfenv   = require("cfenv")
var express = require("express")

// get cloud foundry appEnv
var AppEnv = cfenv.getAppEnv()

// placeholder to fill with our bound service info
var ServiceInfo

// create the express app
var app = express()

// only supports home page
app.get("/", onHomePage)

// initialize services, passing a callback to start the server
initServices(function() {
  app.listen(AppEnv.port, AppEnv.bind, onStarting)
})

//------------------------------------------------------------------------------
function initServices(cb) {
  ServiceInfo = getServiceInfo()
  log("service info: \n" + ServiceInfo)

  setTimeout(cb, 0)
}

//------------------------------------------------------------------------------
function onStarting(request, response) {
  log("server starting on " + AppEnv.url)
}

//------------------------------------------------------------------------------
function onHomePage(request, response) {
  response.send("check the console for service information")
}

//------------------------------------------------------------------------------
function getServiceInfo() {
  var serviceA = AppEnv.getService("ServiceA")
  var serviceB = AppEnv.getService("ServiceB")
  var serviceX = AppEnv.getService(/Service?/) || {name: "(not bound)"}
  var services = AppEnv.getServices()

  var output = []
  output.push("  isLocal?        - " + yesNo(AppEnv.isLocal))
  output.push("  ServiceA bound? - " + yesNo(serviceA))
  output.push("  ServiceB bound? - " + yesNo(serviceB))
  output.push("  /Service?/      - " + serviceX.name)

  output.push("bound services:")

  var someServices = false
  for (var serviceName in services) {
    var service = services[serviceName]
    var creds   = JSON.stringify(service.credentials)

    output.push("  " + service.label + ": " + service.name + ": " + creds)

    someServices = true
  }

  if (!someServices) {
    output.push("  (none)")
  }
  return output.join("\n")
}

//------------------------------------------------------------------------------
function yesNo(bool) {
  return bool ? "yes" : "no"
}

//------------------------------------------------------------------------------
function log(message) {
    console.log(AppEnv.name + ": " + message)
}

//------------------------------------------------------------------------------
// Copyright 2014 Patrick Mueller
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//------------------------------------------------------------------------------
