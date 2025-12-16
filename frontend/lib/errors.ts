export class OracleError extends Error {
  constructor(
    message: string,
    public code?: string,
    public userMessage?: string
  ) {
    super(message);
    this.name = "OracleError";
  }
}

export class WalletNotConnectedError extends OracleError {
  constructor() {
    super("錢包未連接", "WALLET_NOT_CONNECTED", "請先連接您的錢包");
  }
}

export class InsufficientBalanceError extends OracleError {
  constructor(required: number, actual: number) {
    super(
      `Insufficient MGC balance. Required: ${required}, Actual: ${actual}`,
      "INSUFFICIENT_BALANCE",
      `MGC 餘額不足。需要 ${required} MGC，目前僅有 ${actual} MGC`
    );
  }
}

export class TransactionFailedError extends OracleError {
  constructor(reason?: string) {
    super(
      `Transaction failed: ${reason || "Unknown"}`,
      "TRANSACTION_FAILED",
      `交易失敗${reason ? `：${reason}` : ""}`
    );
  }
}

export class AlreadyCheckedInError extends OracleError {
  constructor(nextCheckInTime: Date) {
    super(
      "Already checked in today",
      "ALREADY_CHECKED_IN",
      `今天已經簽到過了。下次簽到時間：${nextCheckInTime.toLocaleString("zh-TW", { hour: "2-digit", minute: "2-digit" })}`
    );
  }
}

export class InvalidAnswerIdError extends OracleError {
  constructor(answerId: number) {
    super(`Invalid answer ID: ${answerId}`, "INVALID_ANSWER_ID", "無效的答案編號");
  }
}

export class NetworkError extends OracleError {
  constructor(message: string) {
    super(message, "NETWORK_ERROR", "網路錯誤，請稍後再試");
  }
}

export function handleError(error: unknown): string {
  if (error instanceof OracleError) {
    return error.userMessage || error.message;
  }

  if (error instanceof Error) {
    return `發生錯誤：${error.message}`;
  }

  return "發生未知錯誤，請稍後再試";
}
