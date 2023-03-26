# Mythic Table Gatling Load Tester

## Running the Tests
- In order to run these tests you will need `docker` and `docker-compose` on your machine.
- You must be running the main Mythic Table docker image (run `docker-compose up` from the root directory of this repo).
- The docker-compose config requires two variables set in the tests/include/.env file in order to correctly map the docker internal user to your host machine.
  - This file is created and updated automatically if you run the tests via the `runTests.sh` script included, however if you wish to run `docker-compose` manually you will need to create it. See below for the contents.

### Running Via Script
*This has so far only been tested in a Linux environment.*
- Execute the `tests/runTests.sh` script.
  - This should set up the aforementioned .env file and execute `docker-compose`.

### Running Manually
- Create the .env file as described below.
- Connect the **mythicapp** running container to the *mythictable_test* network with the command `docker network connect mythictable_test mythicapp` if it is not already connected.
- Navigate to the `tests/include` directory.
- Execute `docker-compose up --build` to update the test container and run tests.

### Example Contents for .env File
* Save this file as tests/include/.env
* This example assumes your local user uid and gid are both set to 1000 as is common on most Linux distributions. See your OS documentation for information on how to obtain these values.

```
USER_ID=1000
GROUP_ID=1000
NETWORK_NAME=mythictable_test
```

## Writing Tests

- Tests are written in scala language.
- Place these test files in the tests/user_files/simulations directory, creating subdirectories to match the package name as required (see below example).
- To add the test to the running sequence, edit tests/conf/testsToRun.list. Note that you need to include the fully qualified name to the test class (include the package name).
  - The list file supports '#' characters for comments for clarity and grouping of tests.

### Example Test (From Gatling Wiki)

- This example script would be placed in the *tests/user_files/simulations/com/mythictable/test* directory.
- You would then add `com.mythictable.test.BasicSimulation` to the *testsToRun.list* file.

```scala
package com.mythictable.test

import io.gatling.core.Predef._
import io.gatling.http.Predef._
import scala.concurrent.duration._

class BasicSimulation extends Simulation {

  val httpProtocol = http
    .baseUrl("http://computer-database.gatling.io")
    .acceptHeader("text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8")
    .doNotTrackHeader("1")
    .acceptLanguageHeader("en-US,en;q=0.5")
    .acceptEncodingHeader("gzip, deflate")
    .userAgentHeader("Mozilla/5.0 (Windows NT 5.1; rv:31.0) Gecko/20100101 Firefox/31.0")

  val scn = scenario("BasicSimulation")
    .exec(http("request_1")
      .get("/"))
    .pause(5)

  setUp(
    scn.inject(atOnceUsers(1))
  ).protocols(httpProtocol)
}

```
