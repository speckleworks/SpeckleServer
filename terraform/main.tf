terraform {
  backend "s3" {
    bucket = "rhdhv-terraform-state-speckle-prod"
    key    = "terraform/speckle-prod"
    region = "eu-west-1"
  }
}

provider "heroku" {
  version = "~> 1.8"
}

resource "heroku_app" "speckle" {
  name   = "${var.application}"
  region = "eu"

  organization = {
    name = "org-haskoning"
  }

  config_vars {
    SERVER_NAME = "${var.SERVER_NAME}"
    CANONICAL_URL="https://${var.application}.herokuapp.com"
  }

  sensitive_config_vars {
    SESSION_SECRET = "${var.SESSION_SECRET}"
  }
}

# Build code & release to the app
resource "heroku_build" "speckle" {
  app        = "${heroku_app.speckle.name}"
  buildpacks = ["https://github.com/heroku/heroku-buildpack-nodejs"]

  source = {
    url = "https://github.com/RoyalHaskoningDHV/SpeckleServer/releases/download/v1.0/slug.tar.gz"
  }
}

# Launch the app's web process by scaling-up
resource "heroku_formation" "speckle" {
  app        = "${heroku_app.speckle.name}"
  type       = "web"
  quantity   = 1
  size       = "Standard-1x"
  depends_on = ["heroku_build.speckle"]
}

resource "heroku_addon" "mongo" {
  app  = "${heroku_app.speckle.name}"
  plan = "mongolab:shared-cluster-2"
}

resource "heroku_addon" "redis" {
  app  = "${heroku_app.speckle.name}"
  plan = "heroku-redis:premium-0"
}

resource "heroku_addon" "papertrail" {
  app  = "${heroku_app.speckle.name}"
  plan = "papertrail:choklad"
}

output "speckle_app_url" {
  value = "https://${heroku_app.speckle.name}.herokuapp.com"
}
