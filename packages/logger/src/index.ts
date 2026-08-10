/**
 * Structured logger for ODOS microservices.
 * Formats logs as colored lines in development and structured JSON in production.
 */
export class OdosLogger {
  private readonly context: string;

  constructor(context: string = 'Application') {
    this.context = context;
  }

  private formatMessage(level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG', message: any, trace?: string): string {
    const isProduction = process.env.NODE_ENV === 'production';
    const timestamp = new Date().toISOString();
    const cleanMessage = typeof message === 'object' ? JSON.stringify(message) : message;

    if (isProduction) {
      return JSON.stringify({
        timestamp,
        level,
        context: this.context,
        message: cleanMessage,
        ...(trace ? { trace } : {}),
      });
    }

    const colors = {
      INFO: '\x1b[32m',    // green
      WARN: '\x1b[33m',    // yellow
      ERROR: '\x1b[31m',   // red
      DEBUG: '\x1b[34m',   // blue
      RESET: '\x1b[0m',
    };

    const color = colors[level];
    const reset = colors.RESET;
    const formattedTrace = trace ? `\n\x1b[31m${trace}${reset}` : '';

    return `[${timestamp}] ${color}${level}${reset} \x1b[36m[${this.context}]\x1b[0m ${cleanMessage}${formattedTrace}`;
  }

  log(message: any) {
    console.log(this.formatMessage('INFO', message));
  }

  error(message: any, trace?: string) {
    console.error(this.formatMessage('ERROR', message, trace));
  }

  warn(message: any) {
    console.warn(this.formatMessage('WARN', message));
  }

  debug(message: any) {
    console.debug(this.formatMessage('DEBUG', message));
  }
}
