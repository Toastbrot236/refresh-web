import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse} from '@angular/common/http';
import {map, Observable} from "rxjs";
import {RefreshApiResponse} from "../refresh-api-response";
import {ListWithData} from "../list-with-data";

export class APIv3Interceptor implements HttpInterceptor {
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(req)
            .pipe(map(e => this.parseAPIv3Response(e)));
    }

    private parseAPIv3Response(event: HttpEvent<any>): HttpEvent<any> {
        if (event instanceof HttpResponse) {
            let body: RefreshApiResponse<any> = event.body;
            if (!body.success) {
                console.error(`Unsuccessful API response for ${event.url}, status ${event.status}: ${(body.error?.name ?? "no error name")}, ${(body.error?.message ?? "no error message")}`);
            }

            // if status is not successful, and no API error message is given, insert API error data for some specific codes.
            // Also init some other response data in this case.
            if (event.status > 399 && !body.error) {
                body = {
                    success: false,
                    data: undefined,
                    listInfo: undefined,
                    error: {
                        name: "ApiUnknownError", // don't think we ever use this here, but set it anyway
                        message: "An unknown error happened: status " + event.status, // set later
                        warning: undefined,
                        statusCode: event.status
                    }
                }

                const bodyStr: string = event.body;

                // Could've probably put this into a switch statement, but this way we can also check for additional conditions
                if (event.status === 429) {
                    // TODO use that one response header to show the exact time to wait
                    body.error!.name = "ApiTooManyRequestsError";
                    body.error!.message = "You have been rate-limited. Please wait a while and try again, and do not spam requests.";
                }
                else if (event.status === 403) {
                    body.error!.name = "ApiAuthenticationError";
                    body.error!.message = "Authentication failed. Try to log in, and see if that fixes this issue.";
                }
                else if ((event.status === 404 && bodyStr.startsWith("Not found: /api")) || event.status === 501) {
                    body.error!.name = "ApiNotFoundError";
                    body.error!.message = "This feature seems to be unimplemented by the Refresh server, or it was badly implemented by this website. Please report this to the server operator.";
                }
                else if (event.status === 404) {
                    body.error!.name = "ApiNotFoundError";
                    body.error!.message = "Something unknown wasn't found. Please report this to the server operator.";
                }
                else if (event.status === 400) {
                    body.error!.name = "ApiValidationError";
                    body.error!.message = "The request was malformed. Either it was badly implemented by the website, or you should change your request. Please report this to the server operator regardless.";
                }
                else if (event.status === 401) {
                    body.error!.name = "ApiValidationError";
                    body.error!.message = "You are not authorized to do this. Either your role is too low, or your email address is not verified, or the server is in maintenance mode.";
                }
                else if (event.status === 500) {
                    body.error!.name = "ApiInternalServerError";
                    body.error!.message = "Something unknown seems to have gone wrong at the other end. Please report this to the server operator.";
                }
                else if (event.status > 501) {
                    body.error!.name = "ApiInternalServerError";
                    body.error!.message = "It seems the Refresh server is currently unavailable. Please try again later.";
                }
            }

            // if we have list info, we need to include that data in the response
            if (body.listInfo) {
                const newBody: ListWithData<any> = {
                    data: body.data,
                    listInfo: body.listInfo,
                }

                return event.clone({
                    body: newBody
                })
            }

            return event.clone({
                body: body.data
            })
        }
        return event;
    }
}
