variable "application" {
  description = "The name of the app."
  default = "speckle"
}

variable "SESSION_SECRET" {
  description = "This is used in the encryption of the api access tokens."
}

variable "SERVER_NAME" {
  default = "RHDHV Speckle Server"
  description = "Name of the Speckle Server"
}