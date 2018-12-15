# import models
# from datetime import datetime, date, time
#
#
# def get_session_id(login):
#     session = Session()
#     session.key = login + str(random.randint(1, 1000))
#     session.expires = datetime.now() + timedelta(days=1)
#     session.save()
#     return session.key
