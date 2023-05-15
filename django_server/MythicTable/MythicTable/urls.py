"""src URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter
from Profile.views import ProfileView, ProfileListView, MeView
from Campaign.views import CampaignListView, CampaignView, CampaignJoinView, CampaignLeaveView, CampaignForceLeaveView, CampaignMessagesView, CampaignPlayersView
from Collections.views import CollectionView, CollectionCampaignView, CollectionProfileView
from Files.views import FileListView, FileView
import pymongo
from .consumers import LivePlayConsumer
from django.urls import re_path

router = DefaultRouter()

client = pymongo.MongoClient(settings.MONGODB_HOST)

# Wire up our API using automatic URL routing.
# Additionally, we include login URLs for the browsable API.
urlpatterns = [
    path('', include(router.urls)),
    path('api-auth/', include('rest_framework.urls', namespace='rest_framework')),
    path('api/profiles/me', MeView.as_view(client=client, db_name=settings.MONGODB_DB_NAME)),
    path('api/profiles/<str:profileId>', ProfileView.as_view(client=client, db_name=settings.MONGODB_DB_NAME)),
    path('api/profiles', ProfileListView.as_view(client=client, db_name=settings.MONGODB_DB_NAME)),

    path('api/campaigns', CampaignListView.as_view(client=client, db_name=settings.MONGODB_DB_NAME)),
    path('api/campaigns/join/<str:joinId>', CampaignJoinView.as_view(client=client, db_name=settings.MONGODB_DB_NAME)),
    path('api/campaigns/<str:campaignId>', CampaignView.as_view(client=client, db_name=settings.MONGODB_DB_NAME), name='campaign-detail'),
    path('api/campaigns/<str:campaignId>/players', CampaignPlayersView.as_view(client=client, db_name=settings.MONGODB_DB_NAME)),
    path('api/campaigns/<str:campaignId>/messages', CampaignMessagesView.as_view(client=client, db_name=settings.MONGODB_DB_NAME)),   
    path('api/campaigns/<str:campaignId>/leave', CampaignLeaveView.as_view(client=client, db_name=settings.MONGODB_DB_NAME)),
    path('api/campaigns/<str:campaignId>/forceLeave/<str:playerId>', CampaignForceLeaveView.as_view(client=client, db_name=settings.MONGODB_DB_NAME)),

    path('api/collections/<str:collection>', CollectionView.as_view(client=client, db_name=settings.MONGODB_DB_NAME)), 
    path('api/collections/<str:collection>/id/<str:profileId>', CollectionProfileView.as_view(client=client, db_name=settings.MONGODB_DB_NAME)),
    path('api/collections/<str:collection>/campaign/<str:campaignId>', CollectionCampaignView.as_view(client=client, db_name=settings.MONGODB_DB_NAME)),
    path('api/collections/<str:collection>/campaign/<str:campaignId>/id/<str:itemId>', CollectionCampaignView.as_view(client=client, db_name=settings.MONGODB_DB_NAME)),

    path('api/files', FileListView.as_view(client=client, db_name=settings.MONGODB_DB_NAME)),
    path('api/files/<str:fileId>', FileView.as_view(client=client, db_name=settings.MONGODB_DB_NAME)),
    
]  + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

websocket_urlpatterns = [
    re_path(r'ws/liveplay/$', LivePlayConsumer.as_asgi()),
]