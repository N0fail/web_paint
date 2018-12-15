
#
# class CheckSessionMiddleware(class):
#
#
#     def process_request(request):
#         try:
#             sessid = request.COOKIE.get('sessid')
#             session = Session.objects.get(
#                 key=sessid,
#
#             )
#             request.session = session
#             request.user = session.user
#         except Session.DpesNotExist:
#             request.session = None
