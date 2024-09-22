export class Email {
  constructor(private readonly email: string) {
    if (email === undefined) {
      throw new Error("Email constructor called with undefined");
    }

    const trimmedEmail = email?.trim();
    if (!this.isValidEmail(trimmedEmail)) {
      throw new Error("Invalid email format");
    }
    this.email = email;
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  public get value(): string {
    return this.email;
  }

  public equals(other: Email): boolean {
    return this.email === other.value;
  }

  public toString(): string {
    return this.email;
  }
}
