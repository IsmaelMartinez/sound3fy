# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability in sound3fy, please report it responsibly:

1. **Do not** open a public GitHub issue
2. Email the maintainer directly or use GitHub's private vulnerability reporting
3. Include as much detail as possible:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

## Response Timeline

- **Acknowledgment**: Within 48 hours
- **Initial assessment**: Within 7 days
- **Resolution target**: Within 30 days (depending on severity)

## Scope

This security policy applies to:

- The sound3fy npm package
- The demo site (ismaelmartinez.github.io/sound3fy)
- This GitHub repository

## Security Considerations

sound3fy uses:

- **Web Audio API**: Browser-native, sandboxed audio processing
- **D3.js**: Trusted data visualization library
- **No external network calls**: All processing is client-side

The library does not:
- Collect or transmit user data
- Store any persistent data
- Execute arbitrary code from data inputs

## Hall of Fame

We appreciate security researchers who help keep sound3fy safe. Contributors who responsibly disclose vulnerabilities will be acknowledged here (with their permission).

