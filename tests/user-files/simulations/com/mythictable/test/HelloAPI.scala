package com.mythictable.test

import io.gatling.core.Predef._
import io.gatling.http.Predef._
import scala.concurrent.duration._

import com.mythictable.config.Config

class HelloAPI extends Simulation {

  val path = "/api/hello"

  val httpProtocol = http
    .baseUrl(Config.serverBaseURL)

  val scn = scenario("Hello API Scenario")
    .exec(http("Hello API Request")
      .get(path)
      .check(status.is(200), bodyString.is("hello"))
    )

  setUp(
    scn.inject(atOnceUsers(Config.atOnceUsers))
  ).protocols(httpProtocol)
}
