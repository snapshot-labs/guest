<template>
  <div class="text-base font-serif antialiased min-h-screen">
	  <div>
		  <Sidebar/>
		  <Topnav/>
		  <router-view :key="$route.path" class="p-6 ml-[64px] pt-[112px]" />
	  </div>
  </div>
</template>
