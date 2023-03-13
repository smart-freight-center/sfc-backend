import { TypedError } from "@think-it-labs/typed-error";

export enum EdcManagerErrorType {
  Duplicate = "Duplicate",
  NotFound = "NotFound",
  Unimplemented = "Unimplemented",
  Unknown = "Unknown",
}

export class EdcManagerError extends TypedError<EdcManagerErrorType> {}
