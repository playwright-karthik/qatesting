# python 3 import below:
import http
from http.server import HTTPServer, BaseHTTPRequestHandler
class WebServerHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        try:
            splits = self.path.split("/")
            value = int(splits[-1])
            self.send_response(value)
            self.send_header('Content-type', 'text/html')
            self.end_headers()
            description = http.HTTPStatus(value).description

            page = f'<html><body><h1>status code: {splits[-1]}</h1><h2>{description}</h1></body></html>'
            
            self.wfile.write(page.encode('ascii'))
        except (IOError, ValueError):
            self.send_error(500, "File Not Found {}".format(self.path))

def main():
    try:
        port = 8080
        server = HTTPServer(('', port), WebServerHandler)
        print("Web server is running on port {}".format(port))
        server.serve_forever()

    except KeyboardInterrupt:
        print("^C entered, stopping web server...")
        server.socket.close()


if __name__ == '__main__':
    main()
