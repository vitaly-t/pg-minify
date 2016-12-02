////////////////////////////////////////
// Requires pg-minify v0.4.0 or later.
////////////////////////////////////////

declare namespace pgMinify {
    type minifyOptions = {
        compress?: boolean;
    };

    interface IErrorPosition {
        line: number,
        column: number
    }

    enum parsingErrorCode {
        unclosedMLC = 1,    // Unclosed multi-line comment.
        unclosedText = 2,   // Unclosed text block.
        unclosedQI = 3,     // Unclosed quoted identifier.
        multiLineQI = 4     // Multi-line quoted identifiers are not supported.
    }

    class SQLParsingError implements Error {
        name: string;
        message: string;
        stack: string;
        error: string;
        code: parsingErrorCode;
        position: IErrorPosition;
    }
}

declare function pgMinify(sql: string, options?: pgMinify.minifyOptions): string;

export = pgMinify;
