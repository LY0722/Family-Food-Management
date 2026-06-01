<template>
  <view class="family-member">
    <view class="member-info">
      <image :src="member.avatarUrl || '/static/images/default-avatar.png'" class="member-avatar" />
      <view class="member-detail">
        <text class="member-name">{{ member.nickname }}</text>
        <text class="member-role" v-if="member.role === 'owner'">创建者</text>
      </view>
    </view>
    <view v-if="isOwner && member.role !== 'owner'" class="member-actions">
      <button class="btn-remove" @tap="$emit('remove', member)">移除</button>
    </view>
  </view>
</template>

<script>
export default {
  name: 'FamilyMember',
  props: {
    member: {
      type: Object,
      default: () => ({})
    },
    isOwner: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<style scoped>
.family-member {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx;
  background-color: #fff;
  border-radius: 16rpx;
  margin-bottom: 16rpx;
}
.member-info {
  display: flex;
  align-items: center;
  gap: 20rpx;
}
.member-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
}
.member-name {
  font-size: 30rpx;
  font-weight: 500;
  color: #333;
}
.member-role {
  font-size: 24rpx;
  color: #07c160;
  margin-left: 12rpx;
}
.btn-remove {
  background-color: #ff4d4f;
  color: #fff;
  font-size: 26rpx;
  padding: 12rpx 24rpx;
  border-radius: 30rpx;
  border: none;
}
</style>