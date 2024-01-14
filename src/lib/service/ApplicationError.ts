class ApplicationError extends Error {
  code: number

  constructor (code: number, message: string) {
    super(message)
    this.code = code
  }
}

export default ApplicationError
